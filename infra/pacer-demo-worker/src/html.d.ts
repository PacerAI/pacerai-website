// Text modules: wrangler bundles *.html as a string export (see wrangler.toml [[rules]]).
declare module "*.html" {
  const content: string;
  export default content;
}
