self.__MIDDLEWARE_MATCHERS = [
  {
    "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!api|trpc|_next|_vercel|.*\\..*).*))(\\.json)?[\\/#\\?]?$",
    "originalSource": "/((?!api|trpc|_next|_vercel|.*\\..*).*)"
  }
];self.__MIDDLEWARE_MATCHERS_CB && self.__MIDDLEWARE_MATCHERS_CB()