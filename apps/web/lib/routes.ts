export const routes = {
  home: "/",
  qr: "/qr",
  user: {
    home: "/user",
    requests: "/user/requests",
    requestDetail: (id: string | number) => `/user/requests/${id}`,
    history: "/user/history"
  },
  supporter: {
    home: "/supporter",
    jobs: "/supporter/jobs",
    jobDetail: (id: string | number) => `/supporter/jobs/${id}`,
    profile: "/supporter/profile"
  },
  supporterSignup: {
    emailPassword: "/supporter-signup/email-password"
  }
} as const;
