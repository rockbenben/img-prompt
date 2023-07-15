import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* <script data-ad-client="ca-pub-7585955822109216" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script> */}
        </Head>
        <body>
          <Main />
          <NextScript />
          <script async src="https://oss.newzone.top/instantpage.min.js" type="module"></script>
        </body>
      </Html>
    );
  }
}

export default MyDocument;
