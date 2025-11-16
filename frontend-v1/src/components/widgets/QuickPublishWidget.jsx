import React from 'react';
import { useTranslation } from 'react-i18next';

export default function QuickPublishWidget() {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded shadow-sm p-4">
      <h3 className="text-gray-500 text-xs mb-2">{t('widgets.quickPublish.title')}</h3>
      <select className="select-field mb-3">
        <option>{t('common.select')}</option>
      </select>
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
        {t('common.publish')}
      </button>
    </div>
  );
}

