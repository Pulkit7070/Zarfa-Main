import React from 'react';
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

interface RefundItem {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'rejected';
  transactionHash: string;
  merchant: string;
  country: string;
}

const VATRefundHistory: React.FC = () => {
  // Mock data for refund history
  const refundHistory: RefundItem[] = [
    {
      id: 'REF-2023-001',
      date: '2023-11-01T14:30:00',
      amount: 120.50,
      currency: 'USD',
      status: 'completed',
      transactionHash: '0x1234...5678',
      merchant: 'Dubai Mall',
      country: 'UAE'
    },
    {
      id: 'REF-2023-002',
      date: '2023-10-28T09:15:00',
      amount: 85.30,
      currency: 'EUR',
      status: 'pending',
      transactionHash: '0xabcd...ef01',
      merchant: 'Galeries Lafayette',
      country: 'France'
    },
    {
      id: 'REF-2023-003',
      date: '2023-10-25T16:45:00',
      amount: 210.00,
      currency: 'GBP',
      status: 'rejected',
      transactionHash: '0x5678...9012',
      merchant: 'Harrods',
      country: 'UK'
    },
    {
      id: 'REF-2023-004',
      date: '2023-10-20T11:20:00',
      amount: 65.90,
      currency: 'USD',
      status: 'completed',
      transactionHash: '0x3456...7890',
      merchant: 'Sephora',
      country: 'UAE'
    },
    {
      id: 'REF-2023-005',
      date: '2023-10-15T13:10:00',
      amount: 150.25,
      currency: 'EUR',
      status: 'completed',
      transactionHash: '0x7890...1234',
      merchant: 'Zara',
      country: 'Spain'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Refund History</h2>
        
        <div className="space-y-4">
          {refundHistory.map((item) => (
            <div key={item.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {item.merchant}
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        {item.country}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500">{item.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {item.amount.toFixed(2)} {item.currency}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
                <a 
                  href={`https://explorer.monad.xyz/tx/${item.transactionHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  View on Explorer
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VATRefundHistory;
