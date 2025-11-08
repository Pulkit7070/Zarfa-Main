module Zarfa::vat_refund {
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
    const E_INVALID_VAT_RATE: u64 = 4;
    const E_REFUND_NOT_FOUND: u64 = 5;

    //
    // Constants
    //
    const DEFAULT_VAT_RATE: u64 = 20; // 20% VAT rate
    const MAX_VAT_RATE: u64 = 50;     // Maximum 50% VAT rate

    //
    // Data structures
    //
    struct VATRefund has copy, drop, store {
        id: u64,
        applicant: address,
        vat_reg_no: String,
        receipt_no: String,
        bill_amount: u64,
        vat_amount: u64,
        refund_amount: u64,
        currency: String,
        document_hash: String, // Hash of uploaded document
        timestamp: u64,
        status: String, // "pending", "approved", "rejected", "processed"
        processor: address,
        transaction_hash: String,
    }

    struct VATRefundProcessor has key {
        refund_counter: u64,
        refunds: vector<VATRefund>,
        authorized_processors: vector<address>,
        vat_rates: vector<u64>, // Different VAT rates by region/country
        total_refunded: u64,
        refund_events: EventHandle<VATRefund>,
    }

    //
    // Events
    //
    struct VATRefundSubmitted has drop, store {
        refund_id: u64,
        applicant: address,
        vat_amount: u64,
        refund_amount: u64,
    }

    struct VATRefundProcessed has drop, store {
        refund_id: u64,
        applicant: address,
        refund_amount: u64,
        processor: address,
        transaction_hash: String,
    }

    //
    // Functions
    //

    /// Initialize the VAT refund processor
    public fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        
        move_to(account, VATRefundProcessor {
            refund_counter: 0,
            refunds: vector::empty<VATRefund>(),
            authorized_processors: vector::singleton(account_addr),
            vat_rates: vector::singleton(DEFAULT_VAT_RATE),
            total_refunded: 0,
            refund_events: account::new_event_handle<VATRefund>(account),
        });
    }

    /// Submit a VAT refund claim
    public fun submit_vat_refund(
        account: &signer,
        vat_reg_no: String,
        receipt_no: String,
        bill_amount: u64,
        vat_amount: u64,
        currency: String,
        document_hash: String,
    ) acquires VATRefundProcessor {
        let applicant = signer::address_of(account);
        
        // Validate amounts
        assert!(bill_amount > 0, E_INVALID_AMOUNT);
        assert!(vat_amount > 0, E_INVALID_AMOUNT);
        assert!(vat_amount <= bill_amount, E_INVALID_AMOUNT);

        // Get processor
        let processor = borrow_global_mut<VATRefundProcessor>(@Zarfa);
        processor.refund_counter = processor.refund_counter + 1;
        let refund_id = processor.refund_counter;

        // Calculate refund amount (could be less than VAT amount based on policy)
        let refund_amount = vat_amount; // 1:1 refund for now

        // Create refund record
        let vat_refund = VATRefund {
            id: refund_id,
            applicant,
            vat_reg_no,
            receipt_no,
            bill_amount,
            vat_amount,
            refund_amount,
            currency,
            document_hash,
            timestamp: timestamp::now_microseconds(),
            status: string::utf8(b"pending"),
            processor: @Zarfa,
            transaction_hash: string::utf8(b""),
        };

        // Store refund record
        vector::push_back(&mut processor.refunds, vat_refund);
        
        // Emit event
        event::emit_event(&mut processor.refund_events, vat_refund);
    }

    /// Process VAT refund (approve and transfer)
    public fun process_vat_refund<CoinType>(
        processor_account: &signer,
        refund_id: u64,
        approve: bool,
    ) acquires VATRefundProcessor {
        let processor_addr = signer::address_of(processor_account);
        let processor = borrow_global_mut<VATRefundProcessor>(@Zarfa);
        
        // Find the refund
        let refund_index = 0;
        let found = false;
        let refunds_len = vector::length(&processor.refunds);
        
        while (refund_index < refunds_len) {
            let refund = vector::borrow(&processor.refunds, refund_index);
            if (refund.id == refund_id) {
                found = true;
                break
            };
            refund_index = refund_index + 1;
        };
        
        assert!(found, E_REFUND_NOT_FOUND);
        
        // Get mutable reference to the refund
        let refund = vector::borrow_mut(&mut processor.refunds, refund_index);
        
        if (approve) {
            // Transfer refund amount to applicant
            let coin_to_transfer = coin::withdraw<CoinType>(processor_account, refund.refund_amount);
            coin::deposit(refund.applicant, coin_to_transfer);
            
            // Update status
            refund.status = string::utf8(b"processed");
            refund.processor = processor_addr;
            
            // Update total refunded
            processor.total_refunded = processor.total_refunded + refund.refund_amount;
            
            // Emit processed event
            event::emit_event(&mut processor.refund_events, *refund);
        } else {
            // Reject the refund
            refund.status = string::utf8(b"rejected");
            refund.processor = processor_addr;
        };
    }

    /// Get VAT refund history for an applicant
    public fun get_refund_history(applicant: address): vector<VATRefund> acquires VATRefundProcessor {
        let processor = borrow_global<VATRefundProcessor>(@Zarfa);
        let filtered_refunds = vector::empty<VATRefund>();
        
        let i = 0;
        let refunds_len = vector::length(&processor.refunds);
        
        while (i < refunds_len) {
            let refund = vector::borrow(&processor.refunds, i);
            if (refund.applicant == applicant) {
                vector::push_back(&mut filtered_refunds, *refund);
            };
            i = i + 1;
        };
        
        filtered_refunds
    }

    /// Get all pending refunds (for processors)
    public fun get_pending_refunds(): vector<VATRefund> acquires VATRefundProcessor {
        let processor = borrow_global<VATRefundProcessor>(@Zarfa);
        let pending_refunds = vector::empty<VATRefund>();
        
        let i = 0;
        let refunds_len = vector::length(&processor.refunds);
        
        while (i < refunds_len) {
            let refund = vector::borrow(&processor.refunds, i);
            if (refund.status == string::utf8(b"pending")) {
                vector::push_back(&mut pending_refunds, *refund);
            };
            i = i + 1;
        };
        
        pending_refunds
    }

    /// Calculate VAT amount from bill amount
    public fun calculate_vat_amount(bill_amount: u64, vat_rate: u64): u64 {
        assert!(vat_rate <= MAX_VAT_RATE, E_INVALID_VAT_RATE);
        (bill_amount * vat_rate) / (100 + vat_rate)
    }

    /// Get total refunds processed
    public fun get_total_refunded(): u64 acquires VATRefundProcessor {
        let processor = borrow_global<VATRefundProcessor>(@Zarfa);
        processor.total_refunded
    }

    /// Get refund count
    public fun get_refund_count(): u64 acquires VATRefundProcessor {
        let processor = borrow_global<VATRefundProcessor>(@Zarfa);
        processor.refund_counter
    }

    // View functions
    #[view]
    public fun view_refund_history(applicant: address): vector<VATRefund> acquires VATRefundProcessor {
        get_refund_history(applicant)
    }

    #[view]
    public fun view_pending_refunds(): vector<VATRefund> acquires VATRefundProcessor {
        get_pending_refunds()
    }

    #[view]
    public fun view_refund_stats(): (u64, u64) acquires VATRefundProcessor {
        (get_refund_count(), get_total_refunded())
    }
}
