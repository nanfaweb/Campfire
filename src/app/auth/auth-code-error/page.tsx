export default function AuthCodeError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF8F2] text-on-surface p-xl">
      <h1 className="text-4xl font-extrabold mb-md">Authentication Error</h1>
      <p className="text-lg text-on-surface-variant mb-xl text-center max-w-md">
        There was an issue verifying your login. This usually happens if the link expired or was already used.
      </p>
      <a
        href="/auth/signup"
        className="px-lg py-md bg-primary-container text-white rounded-xl font-button hover:scale-[1.02] transition-all"
      >
        Try Again
      </a>
    </div>
  )
}
