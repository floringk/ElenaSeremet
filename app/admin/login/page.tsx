type SearchParams = Promise<{ error?: string }>;

export default async function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const hasError = params.error === "1";

  return (
    <section className="page-section">
      <div className="container admin-login">
        <h1>Admin Login</h1>
        <form action="/api/admin/login" method="post" className="contact-form">
          <label>
            Username
            <input name="username" type="text" required />
          </label>
          <label>
            Password
            <input name="password" type="password" required />
          </label>
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </form>
        {hasError ? <p className="form-error">Credentiale invalide.</p> : null}
      </div>
    </section>
  );
}
