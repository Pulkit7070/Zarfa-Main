import React from 'react';
import { 
  Globe, 
  ArrowUpDown, 
  Shield, 
  Bot, 
  Zap, 
  X,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ServicesPageProps {
  onSelectService: (service: string) => void;
  onClose: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onSelectService, onClose }) => {
  const services = [
    {
      id: 'global-payroll',
      title: 'GlobalPayroll',
      description: 'Seamless payroll for your global team',
      icon: Globe,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'fiat-ramps',
      title: 'FiatOn/OffRamps',
      description: 'Convert between crypto and traditional currencies',
      icon: ArrowUpDown,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'secure-transfer',
      title: 'SecureP2PTransfer',
      description: 'Send money directly, securely, and instantly',
      icon: Shield,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'ai-assistants',
      title: 'AIAssistants',
      description: 'Smart financial assistance powered by AI',
      icon: Bot,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'payment-streaming',
      title: 'PaymentStreaming',
      description: 'Continuous payment flows in real-time',
      icon: Zap,
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  const handleServiceClick = (serviceId: string) => {
    if (serviceId === 'global-payroll') {
      onSelectService('dashboard');
    } else {
      // For other services, you can add specific handling later
      console.log(`Selected service: ${serviceId}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white border border-gray-200 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PayZoll
              </span>{' '}
              <span className="text-gray-900">Services</span>
            </h1>
            <p className="text-gray-600">Enterprise-grade financial solutions for modern businesses</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Services Grid */}
        <div className="p-8">
          <div className="space-y-4">
            {services.map((service, index) => (
              <motion.button
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleServiceClick(service.id)}
                className="w-full text-left p-6 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${service.color} rounded-lg flex items-center justify-center`}>
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{service.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            Select a service to get started with your financial operations
          </p>
        </div>
      </motion.div>
    </div>
  );
};