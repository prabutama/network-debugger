import { useState, useEffect } from 'react'
import './App.css'

function InfoBlock({ title, icon, children }) {
  return (
    <div className="info-block">
      <div className="block-header">
        <span className="block-icon">{icon}</span>
        <h2>{title}</h2>
      </div>
      <div className="block-content">
        {children}
      </div>
    </div>
  )
}

function Field({ label, value }) {
  const display = value || <span className="empty">—</span>
  return (
    <div className="field-row">
      <span className="field-label">{label}</span>
      <span className="field-value">{display}</span>
    </div>
  )
}

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/debug')
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`)
      const json = await response.json()
      setData(json)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-logo">
            <span className="logo-icon">🔍</span>
            <div>
              <h1>Network Debugger</h1>
              <p className="header-sub">Echo &amp; Request Inspector — Kubernetes Edition</p>
            </div>
          </div>
          <div className="header-actions">
            <button
              className={`btn-refresh ${loading ? 'loading' : ''}`}
              onClick={fetchData}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner" /> Fetching…</>
              ) : (
                <><span>↻</span> Refresh</>
              )}
            </button>
            {lastUpdated && (
              <span className="last-updated">Updated: {lastUpdated}</span>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Loading state */}
        {loading && !data && (
          <div className="state-card loading-state">
            <div className="spinner-lg" />
            <p>Fetching data from backend…</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="state-card error-state">
            <span className="state-icon">⚠️</span>
            <div>
              <strong>Request Failed</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Data blocks */}
        {data && (
          <div className="blocks-grid">

            {/* Block 1: Client Identity */}
            <InfoBlock title="Client Identity" icon="🌐">
              <Field label="Remote IP (TCP)" value={data.client?.remote_addr} />
              <Field label="X-Forwarded-For" value={data.client?.x_forwarded_for} />
              <Field label="X-Real-IP" value={data.client?.x_real_ip} />
            </InfoBlock>

            {/* Block 2: Request Info */}
            <InfoBlock title="Request Info" icon="📡">
              <Field label="Method" value={data.request?.method} />
              <Field label="URL / Path" value={data.request?.url} />
              <Field label="Protocol" value={data.request?.proto} />
              <Field label="Host" value={data.request?.host} />
              <Field label="User-Agent" value={data.request?.user_agent} />
            </InfoBlock>

            {/* Block 3: HTTP Headers */}
            <InfoBlock title="HTTP Headers" icon="🗂️">
              <div className="headers-table-wrap">
                <table className="headers-table">
                  <thead>
                    <tr>
                      <th>Header</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.headers && Object.entries(data.headers).sort().map(([key, val]) => (
                      <tr key={key}>
                        <td className="header-key">{key}</td>
                        <td className="header-val">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="header-count">{data.headers ? Object.keys(data.headers).length : 0} headers total</p>
            </InfoBlock>

            {/* Block 4: Kubernetes Pod Info */}
            <InfoBlock title="Kubernetes Pod" icon="☸️">
              <Field label="Pod Name" value={data.pod?.name} />
              <Field label="Namespace" value={data.pod?.namespace} />
              <Field label="Node Name" value={data.pod?.node_name} />
              <div className="pod-note">
                💡 Refresh berulang kali untuk melihat load balancing antar pod.
              </div>
            </InfoBlock>

          </div>
        )}

        {/* Timestamp footer */}
        {data?.timestamp && (
          <p className="data-timestamp">Backend timestamp: {new Date(data.timestamp).toLocaleString()}</p>
        )}
      </main>
    </div>
  )
}

export default App
