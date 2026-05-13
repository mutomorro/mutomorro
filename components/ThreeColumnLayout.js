export default function ThreeColumnLayout({ toc, sidebar, children }) {
  // The inner column is a div rather than a <main> because the host page
  // already wraps the whole page in a top-level <main>. Two main elements
  // on one page is invalid HTML.
  return (
    <div className="three-col-layout">
      <aside className="three-col-layout__toc">{toc}</aside>
      <div className="three-col-layout__content">{children}</div>
      <aside className="three-col-layout__sidebar">{sidebar}</aside>
    </div>
  )
}
