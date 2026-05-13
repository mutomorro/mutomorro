export default function ThreeColumnLayout({ toc, sidebar, children }) {
  return (
    <div className="three-col-layout">
      <aside className="three-col-layout__toc">{toc}</aside>
      <main className="three-col-layout__content">{children}</main>
      <aside className="three-col-layout__sidebar">{sidebar}</aside>
    </div>
  )
}
