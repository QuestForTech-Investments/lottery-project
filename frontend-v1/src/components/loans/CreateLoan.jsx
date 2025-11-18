import React, { useState } from 'react';
import '../../assets/css/FormStyles.css';

const CreateLoan = () => {
  const [formData, setFormData] = useState({
    entityType: '',
    entityId: '',
    loanAmount: '',
    installmentAmount: '',
    paymentFrequency: 'diario',
    startDate: '',
    interestRate: '',
    notes: ''
  });

  // Mockup data for entity types
  const entityTypes = [
    { id: 'betting-pool', name: 'Banca' },
    { id: 'bank', name: 'Banco' },
    { id: 'zone', name: 'Zona' },
    { id: 'collector', name: 'Cobrador' }
  ];

  // Mockup entities (will vary based on entity type)
  const entities = {
    'betting-pool': [
      { id: 1, name: 'LA CENTRAL 01' },
      { id: 2, name: 'LA CENTRAL 02' },
      { id: 3, name: 'SUPER BANCA' },
      { id: 4, name: 'BANCA REAL' }
    ],
    'bank': [
      { id: 1, name: 'Banco Popular' },
      { id: 2, name: 'BanReservas' },
      { id: 3, name: 'Banco BHD' }
    ],
    'zone': [
      { id: 1, name: 'Zona Norte' },
      { id: 2, name: 'Zona Sur' },
      { id: 3, name: 'Zona Este' }
    ],
    'collector': [
      { id: 1, name: 'Juan Pérez' },
      { id: 2, name: 'María González' }
    ]
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset entity when entity type changes
    if (name === 'entityType') {
      setFormData(prev => ({ ...prev, entityId: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Crear préstamo:', formData);
    // TODO: Implement API call
    alert('Préstamo creado exitosamente');
  };

  const availableEntities = formData.entityType ? entities[formData.entityType] : [];

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="card">
        <div className="card-body">
          {/* Title */}
          <h3 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c2c2c' }}>
            Crear préstamo
          </h3>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Tipo de entidad */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ width: '280px', marginBottom: 0, fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                Tipo de entidad
              </label>
              <select
                name="entityType"
                className="form-control"
                value={formData.entityType}
                onChange={handleInputChange}
                required
                style={{ flex: 1, height: '31px', fontSize: '14px' }}
              >
                <option value="">Seleccione</option>
                {entityTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* Entidad */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ width: '280px', marginBottom: 0, fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                Entidad
              </label>
              <select
                name="entityId"
                className="form-control"
                value={formData.entityId}
                onChange={handleInputChange}
                required
                disabled={!formData.entityType}
                style={{ flex: 1, height: '31px', fontSize: '14px' }}
              >
                <option value="">Seleccione</option>
                {availableEntities.map(entity => (
                  <option key={entity.id} value={entity.id}>{entity.name}</option>
                ))}
              </select>
            </div>

            {/* Monto a prestar */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ width: '280px', marginBottom: 0, fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                Monto a prestar
              </label>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '14px',
                  color: '#6c757d'
                }}>$</span>
                <input
                  type="number"
                  name="loanAmount"
                  className="form-control"
                  value={formData.loanAmount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  style={{ height: '31px', fontSize: '14px', paddingLeft: '25px' }}
                />
              </div>
            </div>

            {/* Monto cuota */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ width: '280px', marginBottom: 0, fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                Monto cuota
              </label>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '14px',
                  color: '#6c757d'
                }}>$</span>
                <input
                  type="number"
                  name="installmentAmount"
                  className="form-control"
                  value={formData.installmentAmount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  style={{ height: '31px', fontSize: '14px', paddingLeft: '25px' }}
                />
              </div>
            </div>

            {/* Frecuencia de pago */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ width: '280px', marginBottom: 0, fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                Frecuencia de pago
              </label>
              <div style={{ flex: 1, display: 'flex', gap: '15px' }}>
                {['diario', 'semanal', 'mensual', 'anual'].map(freq => (
                  <label key={freq} style={{ display: 'flex', alignItems: 'center', marginBottom: 0, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="paymentFrequency"
                      value={freq}
                      checked={formData.paymentFrequency === freq}
                      onChange={handleInputChange}
                      style={{ marginRight: '5px' }}
                    />
                    <span style={{ fontSize: '14px', textTransform: 'capitalize' }}>{freq}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fecha de inicio del préstamo */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ width: '280px', marginBottom: 0, fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                Fecha de inicio del préstamo
              </label>
              <input
                type="date"
                name="startDate"
                className="form-control"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                style={{ flex: 1, height: '31px', fontSize: '14px' }}
              />
            </div>

            {/* Tasa de interés */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ width: '280px', marginBottom: 0, fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                Tasa de interés
              </label>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="number"
                  name="interestRate"
                  className="form-control"
                  value={formData.interestRate}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0.0"
                  style={{ height: '31px', fontSize: '14px', paddingRight: '25px' }}
                />
                <span style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '14px',
                  color: '#6c757d'
                }}>%</span>
              </div>
            </div>

            {/* Notas */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
              <label style={{ width: '280px', marginBottom: 0, fontSize: '12px', color: 'rgb(120, 120, 120)', paddingTop: '8px' }}>
                Notas
              </label>
              <textarea
                name="notes"
                className="form-control"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Notas adicionales..."
                style={{ flex: 1, fontSize: '14px' }}
              />
            </div>

            {/* Submit Button */}
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button
                type="submit"
                className="btn btn-info"
                style={{
                  backgroundColor: '#51cbce',
                  borderColor: '#51cbce',
                  color: 'white',
                  padding: '8px 24px',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Crear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLoan;
