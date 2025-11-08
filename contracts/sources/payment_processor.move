module Zarfa::payment_processor {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;

    //
    // Errors
    //
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 2;
    const E_INVALID_AMOUNT: u64 = 3;
    const E_PAYMENT_NOT_FOUND: u64 = 4;
    const E_ALREADY_PROCESSED: u64 = 5;

    //
    // Data structures
    //
    struct PaymentRecord has copy, drop, store {
        id: u64,
        from: address,
        to: address,
        amount: u64,
        currency: String,
        payment_type: String, // "payroll", "vat_refund", "bulk"
        employee_id: String,
        timestamp: u64,
        status: String, // "pending", "completed", "failed"
        transaction_hash: String,
    }

    struct BulkPayment has copy, drop, store {
        id: u64,
        from: address,
        recipients: vector<address>,
        amounts: vector<u64>,
        currency: String,
        total_amount: u64,
        timestamp: u64,
        status: String,
    }

    struct PaymentProcessor has key {
        payment_counter: u64,
        bulk_counter: u64,
        payments: vector<PaymentRecord>,
        bulk_payments: vector<BulkPayment>,
        authorized_accounts: vector<address>,
        payment_events: EventHandle<PaymentRecord>,
        bulk_payment_events: EventHandle<BulkPayment>,
    }

    //
    // Events
    //
    struct PaymentProcessedEvent has drop, store {
        payment_id: u64,
        from: address,
        to: address,
        amount: u64,
        currency: String,
        payment_type: String,
    }

    struct BulkPaymentProcessedEvent has drop, store {
        bulk_id: u64,
        from: address,
        total_recipients: u64,
        total_amount: u64,
        currency: String,
    }

    //
    // Functions
    //

    /// Initialize the payment processor module
    public fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        
        move_to(account, PaymentProcessor {
            payment_counter: 0,
            bulk_counter: 0,
            payments: vector::empty<PaymentRecord>(),
            bulk_payments: vector::empty<BulkPayment>(),
            authorized_accounts: vector::singleton(account_addr),
            payment_events: account::new_event_handle<PaymentRecord>(account),
            bulk_payment_events: account::new_event_handle<BulkPayment>(account),
        });
    }

    /// Process a single payment (VAT refund or payroll)
    public fun process_payment<CoinType>(
        account: &signer,
        to: address,
        amount: u64,
        currency: String,
        payment_type: String,
        employee_id: String,
    ) acquires PaymentProcessor {
        let from = signer::address_of(account);
        
        // Validate amount
        assert!(amount > 0, E_INVALID_AMOUNT);

        // Get payment processor
        let processor = borrow_global_mut<PaymentProcessor>(@Zarfa);
        
        // Create payment record
        processor.payment_counter = processor.payment_counter + 1;
        let payment_id = processor.payment_counter;
        
        let payment_record = PaymentRecord {
            id: payment_id,
            from,
            to,
            amount,
            currency,
            payment_type,
            employee_id,
            timestamp: timestamp::now_microseconds(),
            status: string::utf8(b"pending"),
            transaction_hash: string::utf8(b""),
        };

        // Transfer coins
        let coin_to_transfer = coin::withdraw<CoinType>(account, amount);
        coin::deposit(to, coin_to_transfer);

        // Update status to completed
        payment_record.status = string::utf8(b"completed");
        
        // Store payment record
        vector::push_back(&mut processor.payments, payment_record);
        
        // Emit event
        event::emit_event(&mut processor.payment_events, payment_record);
    }

    /// Process bulk payments (payroll)
    public fun process_bulk_payment<CoinType>(
        account: &signer,
        recipients: vector<address>,
        amounts: vector<u64>,
        currency: String,
    ) acquires PaymentProcessor {
        let from = signer::address_of(account);
        let recipient_count = vector::length(&recipients);
        let amount_count = vector::length(&amounts);
        
        // Validate inputs
        assert!(recipient_count == amount_count, E_INVALID_AMOUNT);
        assert!(recipient_count > 0, E_INVALID_AMOUNT);

        // Calculate total amount
        let total_amount = 0u64;
        let i = 0;
        while (i < amount_count) {
            total_amount = total_amount + *vector::borrow(&amounts, i);
            i = i + 1;
        };

        // Get payment processor
        let processor = borrow_global_mut<PaymentProcessor>(@Zarfa);
        processor.bulk_counter = processor.bulk_counter + 1;
        let bulk_id = processor.bulk_counter;

        // Process each payment
        i = 0;
        while (i < recipient_count) {
            let recipient = *vector::borrow(&recipients, i);
            let amount = *vector::borrow(&amounts, i);
            
            // Validate amount
            assert!(amount > 0, E_INVALID_AMOUNT);
            
            // Transfer coins
            let coin_to_transfer = coin::withdraw<CoinType>(account, amount);
            coin::deposit(recipient, coin_to_transfer);
            
            i = i + 1;
        };

        // Create bulk payment record
        let bulk_payment = BulkPayment {
            id: bulk_id,
            from,
            recipients,
            amounts,
            currency,
            total_amount,
            timestamp: timestamp::now_microseconds(),
            status: string::utf8(b"completed"),
        };

        // Store bulk payment record
        vector::push_back(&mut processor.bulk_payments, bulk_payment);
        
        // Emit event
        event::emit_event(&mut processor.bulk_payment_events, bulk_payment);
    }

    /// Get payment history for an account
    public fun get_payment_history(account_addr: address): vector<PaymentRecord> acquires PaymentProcessor {
        let processor = borrow_global<PaymentProcessor>(@Zarfa);
        let filtered_payments = vector::empty<PaymentRecord>();
        
        let i = 0;
        let payments_len = vector::length(&processor.payments);
        
        while (i < payments_len) {
            let payment = vector::borrow(&processor.payments, i);
            if (payment.from == account_addr || payment.to == account_addr) {
                vector::push_back(&mut filtered_payments, *payment);
            };
            i = i + 1;
        };
        
        filtered_payments
    }

    /// Get bulk payment history for an account
    public fun get_bulk_payment_history(account_addr: address): vector<BulkPayment> acquires PaymentProcessor {
        let processor = borrow_global<PaymentProcessor>(@Zarfa);
        let filtered_payments = vector::empty<BulkPayment>();
        
        let i = 0;
        let payments_len = vector::length(&processor.bulk_payments);
        
        while (i < payments_len) {
            let payment = vector::borrow(&processor.bulk_payments, i);
            if (payment.from == account_addr) {
                vector::push_back(&mut filtered_payments, *payment);
            };
            i = i + 1;
        };
        
        filtered_payments
    }

    /// Get total payment count
    public fun get_payment_count(): u64 acquires PaymentProcessor {
        let processor = borrow_global<PaymentProcessor>(@Zarfa);
        processor.payment_counter
    }

    /// Get total bulk payment count
    public fun get_bulk_payment_count(): u64 acquires PaymentProcessor {
        let processor = borrow_global<PaymentProcessor>(@Zarfa);
        processor.bulk_counter
    }

    // View functions for testing
    #[view]
    public fun view_payment_history(account_addr: address): vector<PaymentRecord> acquires PaymentProcessor {
        get_payment_history(account_addr)
    }

    #[view]
    public fun view_bulk_payment_history(account_addr: address): vector<BulkPayment> acquires PaymentProcessor {
        get_bulk_payment_history(account_addr)
    }
}
