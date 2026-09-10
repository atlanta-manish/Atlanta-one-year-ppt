import React, { Component } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <main className="startup-error"><h1>The presentation could not open.</h1><p>Reload this page, or open the included PowerPoint file.</p><button onClick={() => window.location.reload()}>Reload presentation</button></main>
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(<React.StrictMode><ErrorBoundary><App /></ErrorBoundary></React.StrictMode>)
