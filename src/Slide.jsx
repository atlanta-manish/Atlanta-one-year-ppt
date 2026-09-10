import React, { memo } from 'react'
import { profile, slides } from './slides'

function Item({ item, numbered = false }) {
  return <div className="content-item">
    {numbered && <div className="item-number">{item.number}</div>}
    <h3>{item.title}</h3>
    <p>{item.text}</p>
    {item.detail && <div className="item-detail">{item.detail}</div>}
  </div>
}

export const Slide = memo(function Slide({ slide, index, miniature = false }) {
  const dark = slide.theme === 'dark'
  return <article className={`slide layout-${slide.layout} ${dark ? 'theme-dark' : 'theme-light'}`} aria-hidden={miniature || undefined}>
    <div className="slide-topline"><span>{slide.eyebrow}</span><span className="slide-brand">ATLANTA SYSTEMS</span></div>
    {(slide.layout === 'cover' || slide.layout === 'closing') ? <div className="cover-content">
      <h1>{slide.title}</h1>
      <p className="cover-subtitle">{slide.subtitle}</p>
      {slide.statement && <p className="closing-statement">{slide.statement}</p>}
      <div className="author"><strong>{profile.name}</strong><span>{profile.role}</span><span>{profile.company}</span></div>
    </div> : <>
      <header className="slide-heading"><h2>{slide.title}</h2>{slide.subtitle && <p>{slide.subtitle}</p>}</header>
      <div className="slide-body">
        {slide.layout === 'metrics' && <div className="metric-grid">{slide.metrics.map(metric => <div className="metric" key={metric.label}><strong>{metric.value}</strong><h3>{metric.label}</h3><p>{metric.detail}</p></div>)}</div>}
        {slide.layout === 'columns' && <div className="column-grid">{slide.items.map(item => <Item key={item.title} item={item} numbered />)}</div>}
        {slide.layout === 'project' && <div className="project-grid"><div className="project-statement">{slide.statement}</div><div className="project-items">{slide.items.map(item => <Item key={item.title} item={item} />)}</div></div>}
        {slide.layout === 'rows' && <div className="row-list">{slide.items.map((item, i) => <div className="content-row" key={item.title}><span className="row-number">0{i + 1}</span><h3>{item.title}</h3><p>{item.text}</p></div>)}</div>}
        {slide.layout === 'outcome' && <div className="outcome-grid"><div className="outcome-result"><span>{slide.resultLabel}</span><strong>{slide.result}</strong></div><div className="outcome-items">{slide.items.map(item => <Item key={item.title} item={item} />)}</div></div>}
        {slide.layout === 'architecture' && <><div className="architecture-list">{slide.items.map(item => <div className="architecture-row" key={item.title}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></div>)}</div><div className="small-metrics">{slide.metrics.map(metric => <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}</div></>}
        {slide.layout === 'table' && <table className="slide-table"><thead><tr>{slide.headers.map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{slide.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0 ? <th scope="row" key={j}>{cell}</th> : <td key={j}>{cell}</td>)}</tr>)}</tbody></table>}
      </div>
      {slide.takeaway && <div className="takeaway">{slide.takeaway}</div>}
    </>}
    <footer className="slide-footer"><span>{slide.footnote || (slide.layout === 'cover' ? 'RTAPE / ITMS / VLTD' : profile.name + ' / Annual performance review')}</span><span>{String(index + 1).padStart(2, '0')}<em> / {String(slides.length).padStart(2, '0')}</em></span></footer>
  </article>
})
