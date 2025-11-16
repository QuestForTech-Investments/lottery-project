import React from 'react';
import { useTranslation } from 'react-i18next';

export default function DrawPlaysWidget() {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded shadow-sm p-4">
      <h3 className="text-gray-500 text-xs mb-2">{t('widgets.drawPlays.title')}</h3>
      <select className="select-field mb-3">
        <option>{t('widgets.drawPlays.drawOption')}</option>
      </select>
      <div className="bg-gray-100 rounded p-3 text-center text-gray-500" style={{ fontSize: '14px' }}>
        <div className="mb-1">{t('widgets.drawPlays.playType')}</div>
        <div className="mb-1">{t('widgets.drawPlays.play')}</div>
        <div className="mb-2">{t('common.amount')}</div>
        <div className="italic">{t('common.noResults')}</div>
      </div>
    </div>
  );
}

