import React from 'react';
import { useTranslation } from 'react-i18next';

export default function QuickBlockWidget() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 bg-white rounded shadow-sm p-4">
      <h3 className="font-semibold text-sm mb-3" style={{ color: '#2c3e50' }}>
        {t('widgets.quickBlock.title')}
      </h3>
      <div className="grid grid-cols-4 gap-3 mb-4">
        <select className="select-field">
          <option>{t('widgets.quickBlock.draw')}</option>
        </select>
        <select className="select-field">
          <option>{t('widgets.quickBlock.playType')}</option>
        </select>
        <input
          type="text"
          placeholder={t('widgets.quickBlock.play')}
          className="input-field"
        />
        <div className="flex gap-2">
          <button
            style={{ 
              backgroundColor: 'rgb(81, 188, 218)',
              color: 'rgb(255, 255, 255)',
              fontSize: '11.9994px',
              fontWeight: '600',
              borderRadius: '3px',
              padding: '5px 15px'
            }}
            className="flex-1"
          >
            {t('common.add')}
          </button>
          <button
            style={{ 
              backgroundColor: 'rgb(239, 129, 87)',
              color: 'rgb(255, 255, 255)',
              fontSize: '11.9994px',
              fontWeight: '600',
              borderRadius: '3px',
              padding: '5px 15px'
            }}
            className="flex-1 opacity-50 cursor-not-allowed"
            disabled
          >
            {t('common.block')}
          </button>
        </div>
      </div>
    </div>
  );
}

