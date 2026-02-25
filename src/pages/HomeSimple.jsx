import React from 'react'
import { Link } from 'react-router-dom'

function HomeSimple() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a', 
      padding: '100px 20px', 
      color: 'white' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '4rem', 
          marginBottom: '2rem', 
          color: '#D4AF37',
          fontFamily: 'Playfair Display, serif'
        }}>
          Trusted Escort
        </h1>
        <p style={{ 
          fontSize: '1.5rem', 
          marginBottom: '3rem', 
          color: '#ccc' 
        }}>
          Exclusive Companionship Services Across India
        </p>
        
        <Link to="/escorts" style={{
          display: 'inline-block',
          padding: '15px 40px',
          backgroundColor: '#D4AF37',
          color: '#000',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          marginBottom: '4rem'
        }}>
          View Escorts
        </Link>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem', 
          marginTop: '4rem' 
        }}>
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '2rem', 
            borderRadius: '10px', 
            border: '1px solid #D4AF37' 
          }}>
            <h3 style={{ color: '#D4AF37', marginBottom: '1rem', fontSize: '1.5rem' }}>
              Premium Service
            </h3>
            <p style={{ color: '#ccc' }}>
              Luxury companionship experiences tailored to your preferences
            </p>
          </div>
          
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '2rem', 
            borderRadius: '10px', 
            border: '1px solid #D4AF37' 
          }}>
            <h3 style={{ color: '#D4AF37', marginBottom: '1rem', fontSize: '1.5rem' }}>
              100% Discreet
            </h3>
            <p style={{ color: '#ccc' }}>
              Complete privacy and confidentiality guaranteed
            </p>
          </div>
          
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '2rem', 
            borderRadius: '10px', 
            border: '1px solid #D4AF37' 
          }}>
            <h3 style={{ color: '#D4AF37', marginBottom: '1rem', fontSize: '1.5rem' }}>
              Available 24/7
            </h3>
            <p style={{ color: '#ccc' }}>
              Book anytime, anywhere across major Indian cities
            </p>
          </div>
        </div>

        <div style={{ marginTop: '4rem' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            color: '#D4AF37', 
            marginBottom: '2rem',
            fontFamily: 'Playfair Display, serif'
          }}>
            Available in Major Cities
          </h2>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1rem', 
            justifyContent: 'center' 
          }}>
            {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Goa', 'Chennai', 'Kolkata'].map(city => (
              <Link 
                key={city}
                to={`/escorts/in/${city.toLowerCase()}`}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#1a1a1a',
                  color: '#D4AF37',
                  border: '1px solid #D4AF37',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  transition: 'all 0.3s'
                }}
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeSimple
