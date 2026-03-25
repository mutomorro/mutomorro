export default function AdminOverview() {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div>
      <h1 style={{
        fontSize: '28px',
        fontWeight: 400,
        color: '#fff',
        letterSpacing: '-0.02em',
        marginBottom: '4px',
      }}>
        Command Centre
      </h1>
      <p style={{
        fontSize: '14px',
        color: 'rgba(255,255,255,0.4)',
        marginBottom: '40px',
      }}>
        {today}
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        padding: '40px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.5)',
        }}>
          Dashboard coming in Brief 3
        </p>
      </div>
    </div>
  )
}
