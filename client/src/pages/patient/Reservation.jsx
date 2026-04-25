import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/* ── Dummy data ── */
const medicineData = {
  name: 'Metformin 500mg',
  dosage: '500mg',
  packSize: 'Strip of 15 tablets',
  mrp: 145,
  sellingPrice: 85,
};

const pharmacyInfo = {
  name: 'Wellness Forever',
  address: '23, Salt Lake City, Sector V, Kolkata - 700091',
  timing: '8:00 AM – 10:00 PM',
  phone: '+91 98765 43210',
};

/* ── Step labels ── */
const steps = ['Select Medicine', 'Confirm Details', 'Done'];

/* ── Styles ── */
const s = {
  page: {
    maxWidth: '860px',
    margin: '0 auto',
  },

  /* Step indicator */
  stepBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0',
    marginBottom: '2rem',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  stepCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  stepCircleActive: {
    background: '#1D9E75',
    color: '#fff',
  },
  stepCircleDone: {
    background: '#1D9E75',
    color: '#fff',
  },
  stepCircleInactive: {
    background: '#e5e7eb',
    color: '#9ca3af',
  },
  stepLabel: {
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  stepLabelActive: {
    color: '#1D9E75',
  },
  stepLabelInactive: {
    color: '#9ca3af',
  },
  stepLine: {
    width: '60px',
    height: '2px',
    margin: '0 0.75rem',
    flexShrink: 0,
  },
  stepLineActive: {
    background: '#1D9E75',
  },
  stepLineInactive: {
    background: '#e5e7eb',
  },

  /* Two-column layout */
  columns: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start',
  },
  leftCol: {
    flex: 1,
    minWidth: 0,
  },
  rightCol: {
    width: '280px',
    flexShrink: 0,
  },

  /* Cards */
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '1rem',
  },

  /* Medicine info */
  medName: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '0.15rem',
  },
  medMeta: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    marginBottom: '0.75rem',
  },
  pharmacyRow: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#374151',
  },
  addressRow: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginBottom: '1.25rem',
  },

  /* Quantity stepper */
  qtyLabel: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '0.5rem',
  },
  qtyStepper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    marginBottom: '1.5rem',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    overflow: 'hidden',
    width: 'fit-content',
  },
  qtyBtn: {
    width: '40px',
    height: '40px',
    border: 'none',
    background: '#fafbfc',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#374151',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease',
  },
  qtyValue: {
    width: '50px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#1a1a2e',
    borderLeft: '1.5px solid #e5e7eb',
    borderRight: '1.5px solid #e5e7eb',
  },

  /* Price breakdown */
  divider: {
    borderTop: '1px solid #f3f4f6',
    margin: '0.75rem 0',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.88rem',
    color: '#6b7280',
    marginBottom: '0.4rem',
  },
  priceRowBold: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.05rem',
    fontWeight: 800,
    color: '#1D9E75',
    marginTop: '0.5rem',
  },
  discount: {
    color: '#22c55e',
  },

  /* Pharmacy card */
  phName: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '0.25rem',
  },
  phDetail: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginBottom: '0.15rem',
  },
  callBtn: {
    width: '100%',
    padding: '0.65rem',
    borderRadius: '10px',
    border: '1.5px solid #1D9E75',
    background: '#fff',
    color: '#1D9E75',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '1rem',
  },

  /* Confirm button */
  confirmBtn: {
    width: '100%',
    padding: '0.9rem',
    borderRadius: '12px',
    border: 'none',
    background: '#1D9E75',
    color: '#fff',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    boxShadow: '0 4px 14px rgba(29,158,117,0.3)',
    marginTop: '0.5rem',
  },

  /* ── Step 3: Confirmation ── */
  confirmationWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
  confirmationCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '3rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
    textAlign: 'center',
    maxWidth: '420px',
    width: '100%',
  },
  checkCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1D9E75, #17845f)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
    fontSize: '2.2rem',
    color: '#fff',
    boxShadow: '0 8px 24px rgba(29,158,117,0.3)',
  },
  confirmHeading: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#1a1a2e',
    marginBottom: '0.5rem',
  },
  confirmSubtext: {
    fontSize: '0.9rem',
    color: '#6b7280',
    marginBottom: '1.5rem',
  },
  codeLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.35rem',
  },
  codeValue: {
    fontSize: '1.3rem',
    fontWeight: 800,
    fontFamily: "'Courier New', Courier, monospace",
    color: '#1D9E75',
    letterSpacing: '2px',
    marginBottom: '1.5rem',
  },
  qrPlaceholder: {
    width: '160px',
    height: '160px',
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
    fontSize: '0.8rem',
    color: '#9ca3af',
    fontWeight: 500,
  },
  homeBtn: {
    padding: '0.85rem 2.5rem',
    borderRadius: '12px',
    border: 'none',
    background: '#1D9E75',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    boxShadow: '0 4px 14px rgba(29,158,117,0.3)',
  },
};

function Reservation() {
  const { medicineId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(2);
  const [qty, setQty] = useState(1);

  const unitPrice = medicineData.sellingPrice;
  const totalMrp = medicineData.mrp * qty;
  const totalPrice = unitPrice * qty;
  const totalDiscount = totalMrp - totalPrice;

  /* ── Render step indicator ── */
  const renderSteps = () => (
    <div style={s.stepBar}>
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === step;
        const isDone = stepNum < step;

        return (
          <React.Fragment key={label}>
            {i > 0 && (
              <div
                style={{
                  ...s.stepLine,
                  ...(isDone || isActive ? s.stepLineActive : s.stepLineInactive),
                }}
              />
            )}
            <div style={s.stepItem}>
              <div
                style={{
                  ...s.stepCircle,
                  ...(isActive
                    ? s.stepCircleActive
                    : isDone
                    ? s.stepCircleDone
                    : s.stepCircleInactive),
                }}
              >
                {isDone ? '✓' : stepNum}
              </div>
              <span
                style={{
                  ...s.stepLabel,
                  ...(isActive || isDone ? s.stepLabelActive : s.stepLabelInactive),
                }}
              >
                {label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );

  /* ── Step 2: Confirm Details ── */
  const renderStep2 = () => (
    <>
      <div style={s.columns}>
        {/* Left: Order Summary */}
        <div style={s.leftCol}>
          <div style={s.card}>
            <div style={s.cardTitle}>📋 Order Summary</div>

            <div style={s.medName}>{medicineData.name}</div>
            <div style={s.medMeta}>
              {medicineData.dosage} · {medicineData.packSize}
            </div>
            <div style={s.pharmacyRow}>🏪 {pharmacyInfo.name}</div>
            <div style={s.addressRow}>📍 {pharmacyInfo.address}</div>

            {/* Quantity stepper */}
            <div style={s.qtyLabel}>Quantity</div>
            <div style={s.qtyStepper}>
              <button
                style={{
                  ...s.qtyBtn,
                  ...(qty <= 1 ? { color: '#d1d5db', cursor: 'not-allowed' } : {}),
                }}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
              >
                −
              </button>
              <div style={s.qtyValue}>{qty}</div>
              <button
                style={s.qtyBtn}
                onClick={() => setQty((q) => q + 1)}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0fdf7')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#fafbfc')}
              >
                +
              </button>
            </div>

            {/* Price breakdown */}
            <div style={s.divider} />
            <div style={s.priceRow}>
              <span>MRP ({qty}x)</span>
              <span>₹{totalMrp}</span>
            </div>
            <div style={s.priceRow}>
              <span>Discount</span>
              <span style={s.discount}>-₹{totalDiscount}</span>
            </div>
            <div style={s.divider} />
            <div style={s.priceRowBold}>
              <span>You Pay</span>
              <span>₹{totalPrice}</span>
            </div>
          </div>

          {/* Confirm button */}
          <button
            style={s.confirmBtn}
            onClick={() => setStep(3)}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#178c65')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#1D9E75')}
          >
            Confirm Reservation
          </button>
        </div>

        {/* Right: Pharmacy Info */}
        <div style={s.rightCol}>
          <div style={s.card}>
            <div style={s.cardTitle}>🏪 Pharmacy Details</div>
            <div style={s.phName}>{pharmacyInfo.name}</div>
            <div style={s.phDetail}>📍 {pharmacyInfo.address}</div>
            <div style={s.phDetail}>🕐 {pharmacyInfo.timing}</div>
            <div style={s.phDetail}>📞 {pharmacyInfo.phone}</div>

            <button
              style={s.callBtn}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f0fdf7')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
            >
              📞 Call Pharmacy
            </button>
          </div>
        </div>
      </div>
    </>
  );

  /* ── Step 3: Confirmation ── */
  const renderStep3 = () => (
    <div style={s.confirmationWrap}>
      <div style={s.confirmationCard}>
        <div style={s.checkCircle}>✓</div>
        <div style={s.confirmHeading}>Reservation Confirmed!</div>
        <div style={s.confirmSubtext}>
          Your medicine has been reserved. Show the QR code at the pharmacy counter to collect it.
        </div>

        <div style={s.codeLabel}>Reservation Code</div>
        <div style={s.codeValue}>MED-2024-00142</div>

        <div style={s.qrPlaceholder}>QR — Show at counter</div>

        <button
          style={s.homeBtn}
          onClick={() => navigate('/patient/home')}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#178c65')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#1D9E75')}
        >
          Go to Home
        </button>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      {renderSteps()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
}

export default Reservation;
