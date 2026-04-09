type PlaceholderPageProps = {
  title: string;
  body: string;
};

export function PlaceholderPage({ title, body }: PlaceholderPageProps) {
  return (
    <div className="page-wrap page-wrap-narrow">
      <section className="panel page-panel page-panel-centered">
        <h1 className="page-heading">{title}</h1>
        <p className="page-note">{body}</p>
      </section>
    </div>
  );
}
