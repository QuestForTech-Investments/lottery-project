import React from 'react';
import { CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PaymentsWidget() {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b-2" style={{ borderColor: '#51CBCE' }}>
        <CreditCard className="w-5 h-5" style={{ color: '#51CBCE' }} />
        <h3 className="font-semibold text-sm flex-1">{t('common.collection')}</h3>
        <button
          style={{ 
            backgroundColor: 'rgb(81, 203, 206)',
            color: 'rgb(255, 255, 255)',
            fontSize: '11.9994px',
            fontWeight: '600',
            borderRadius: '30px',
            padding: '5px 15px'
          }}
        >
          {t('common.payment')}
        </button>
      </div>
      <div className="space-y-2">
        <select className="select-field">
          <option>{t('widgets.payments.bankCode')}</option>
        </select>
        <select className="select-field">
          <option>{t('common.select')}</option>
        </select>
        <select className="select-field">
          <option>{t('common.select')}</option>
        </select>
        <input
          type="number"
          placeholder={t('common.amount')}
          className="input-field"
        />
        <button
          style={{ 
            backgroundColor: 'rgb(81, 203, 206)',
            color: 'rgb(255, 255, 255)',
            fontSize: '11.9994px',
            fontWeight: '600',
            borderRadius: '30px',
            padding: '11px 23px',
            margin: '10px 1px'
          }}
          className="w-full"
        >
          {t('common.create')}
        </button>
      </div>
    </div>
  );
}

