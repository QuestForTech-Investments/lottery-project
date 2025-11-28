import { useState, type FormEvent, type MouseEvent } from 'react'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

interface PasswordErrors {
  password: string
  confirmation: string
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<PasswordErrors>({ password: '', confirmation: '' })

  const validatePassword = (pwd: string): string => {
    if (!pwd) return 'El campo Contraseña es obligatorio'
    if (pwd.length < 8) return 'Mínimo 8 caracteres'
    if (!/[a-zA-Z]/.test(pwd)) return 'Debe contener al menos una letra'
    if (!/\d/.test(pwd)) return 'Debe contener al menos un número'
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Debe contener al menos un carácter especial'
    return ''
  }

  const processSubmission = () => {
    const passwordError = validatePassword(password)
    const confirmError = password !== passwordConfirmation ? 'Las contraseñas no coinciden' : ''

    setErrors({
      password: passwordError,
      confirmation: confirmError,
    })

    if (!passwordError && !confirmError) {
      alert('Contraseña cambiada exitosamente')
      handleClose()
    }
  }

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    processSubmission()
  }

  const handleConfirmHover = (event: MouseEvent<HTMLButtonElement>, color: string) => {
    event.currentTarget.style.backgroundColor = color
  }

  const handleClose = () => {
    setPassword('')
    setPasswordConfirmation('')
    setErrors({ password: '', confirmation: '' })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '60px 0',
        overflow: 'auto',
        zIndex: 1050,
        fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif'
      }}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose()
        }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 0 15px rgba(0, 0, 0, 0.15), 0 0 1px 1px rgba(0, 0, 0, 0.1)',
          margin: '28px 16px',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '16px',
            borderBottom: '1px solid rgb(221, 221, 221)',
            borderRadius: '4.8px 4.8px 0 0'
          }}
        >
          <h5
            style={{
              margin: 0,
              fontSize: '21.98px',
              fontWeight: '400',
              lineHeight: '32.97px',
              color: 'rgb(44, 44, 44)'
            }}
          >
            Cambiar contraseña
          </h5>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              fontWeight: '700',
              lineHeight: '24px',
              opacity: 0.5,
              cursor: 'pointer',
              padding: '16px',
              margin: '-16px -16px -16px 0',
              textShadow: '0 1px 0 rgb(255, 255, 255)',
              color: 'rgb(0, 0, 0)'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget
              target.style.opacity = '0.8'
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget
              target.style.opacity = '0.5'
            }}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
          }}
        >
          {/* Body */}
          <div
            style={{
              padding: '16px',
              flex: '1 1 auto',
            }}
          >
            {/* Campo Contraseña */}
            <fieldset
              style={{
                border: 'none',
                padding: 0,
                margin: '0 0 10px',
                position: 'relative'
              }}
            >
              <legend
                style={{
                  display: 'block',
                  width: '100%',
                  maxWidth: '100%',
                  padding: '0 0 7px',
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: '400',
                  lineHeight: '21px',
                  color: 'rgb(0, 0, 0)'
                }}
              >
                Contraseña
              </legend>
              <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (e.target.value) {
                      setErrors(prev => ({ ...prev, password: validatePassword(e.target.value) }));
                    }
                  }}
                  autoComplete="new-password"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px',
                    paddingRight: errors.password ? '35px' : '10px',
                    fontSize: '14px',
                    fontWeight: '400',
                    lineHeight: '1.5',
                    color: 'rgb(102, 97, 91)',
                    backgroundColor: 'rgb(255, 255, 255)',
                    border: errors.password ? '1px solid rgb(220, 53, 69)' : '1px solid rgb(221, 221, 221)',
                    borderRadius: '4px',
                    transition: 'color 0.3s ease-in-out, border-color 0.3s ease-in-out, background-color 0.3s ease-in-out',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    height: '40px'
                  }}
                  onFocus={(e) => !errors.password && (e.target.style.borderColor = 'rgb(81, 203, 206)')}
                  onBlur={(e) => !errors.password && (e.target.style.borderColor = 'rgb(221, 221, 221)')}
                />
                {errors.password && (
                  <i 
                    className="fas fa-times" 
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '12px',
                      color: 'rgb(220, 53, 69)',
                      fontSize: '16px',
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                  ></i>
                )}
                {errors.password && (
                  <div
                    style={{
                      display: 'block',
                      marginTop: '4px',
                      fontSize: '11.2px',
                      color: 'rgb(220, 53, 69)',
                      fontWeight: '400',
                      lineHeight: '16.8px'
                    }}
                  >
                    {errors.password}
                  </div>
                )}
                <small
                  style={{
                    display: 'block',
                    marginTop: '4px',
                    fontSize: '11.9994px',
                    color: 'rgb(108, 117, 125)',
                    fontWeight: '400',
                    lineHeight: '17.9991px'
                  }}
                >
                  <div>Requisitos de contraseña</div>
                  <ul
                    style={{
                      margin: '0 0 16px',
                      padding: '0 0 0 40px',
                      listStyle: 'disc outside'
                    }}
                  >
                    <li>Mínimo 8 caracteres</li>
                    <li>Mínimo una letra</li>
                    <li>Mínimo un número</li>
                    <li>Mínimo un caracter especial</li>
                  </ul>
                </small>
              </div>
            </fieldset>

            {/* Campo Confirmación */}
            <fieldset
              style={{
                border: 'none',
                padding: 0,
                margin: '0 0 10px',
                position: 'relative'
              }}
            >
              <legend
                style={{
                  display: 'block',
                  width: '100%',
                  maxWidth: '100%',
                  padding: '0 0 7px',
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: '400',
                  lineHeight: '21px',
                  color: 'rgb(0, 0, 0)'
                }}
              >
                Confirmación
              </legend>
              <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => {
                    setPasswordConfirmation(e.target.value);
                    if (e.target.value && password) {
                      setErrors(prev => ({
                        ...prev,
                        confirmation: e.target.value !== password ? 'Las contraseñas no coinciden' : ''
                      }));
                    }
                  }}
                  autoComplete="new-password"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px',
                    paddingRight: errors.confirmation ? '35px' : '10px',
                    fontSize: '14px',
                    fontWeight: '400',
                    lineHeight: '1.5',
                    color: 'rgb(102, 97, 91)',
                    backgroundColor: 'rgb(255, 255, 255)',
                    border: errors.confirmation ? '1px solid rgb(220, 53, 69)' : '1px solid rgb(221, 221, 221)',
                    borderRadius: '4px',
                    transition: 'color 0.3s ease-in-out, border-color 0.3s ease-in-out, background-color 0.3s ease-in-out',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    height: '40px'
                  }}
                  onFocus={(e) => !errors.confirmation && (e.target.style.borderColor = 'rgb(81, 203, 206)')}
                  onBlur={(e) => !errors.confirmation && (e.target.style.borderColor = 'rgb(221, 221, 221)')}
                />
                {errors.confirmation && (
                  <i 
                    className="fas fa-times" 
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '12px',
                      color: 'rgb(220, 53, 69)',
                      fontSize: '16px',
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                  ></i>
                )}
                {errors.confirmation && (
                  <div
                    style={{
                      display: 'block',
                      marginTop: '4px',
                      fontSize: '11.2px',
                      color: 'rgb(220, 53, 69)',
                      fontWeight: '400',
                      lineHeight: '16.8px'
                    }}
                  >
                    {errors.confirmation}
                  </div>
                )}
              </div>
            </fieldset>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              padding: '16px',
              borderTop: '1px solid rgb(221, 221, 221)',
              borderRadius: '0 0 4.8px 4.8px',
              gap: '8px',
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '11px 22px',
                fontSize: '11.9994px',
                fontWeight: '600',
                lineHeight: '16.1992px',
                textAlign: 'center',
                textTransform: 'uppercase',
                color: 'rgb(255, 255, 255)',
                backgroundColor: 'rgb(102, 97, 91)',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                transition: '0.15s linear',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => handleConfirmHover(e, 'rgb(82, 77, 71)')}
              onMouseLeave={(e) => handleConfirmHover(e, 'rgb(102, 97, 91)')}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '11px 22px',
                fontSize: '11.9994px',
                fontWeight: '600',
                lineHeight: '16.1992px',
                textAlign: 'center',
                textTransform: 'uppercase',
                color: 'rgb(255, 255, 255)',
                backgroundColor: 'rgb(81, 203, 206)',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                transition: '0.15s linear',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => handleConfirmHover(e, 'rgb(61, 183, 186)')}
              onMouseLeave={(e) => handleConfirmHover(e, 'rgb(81, 203, 206)')}
            >
              OK
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
