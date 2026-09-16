export function Header() {
  return (
    <header className="header-bar">
      <div className="header-content">
        <div className="header-left">
          <div className="brand-icon">AR</div>
          <div>
            <h1 className="brand-title">Attendance Register</h1>
          </div>
          <div className="network-pill">
            <span className="network-dot" />
            BOT Chain Testnet
          </div>
        </div>

        <div className="header-right">
          <appkit-button />
        </div>
      </div>
    </header>
  )
}
