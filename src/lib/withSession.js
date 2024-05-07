import { getSession } from 'next-auth/react';

// Higher-order function to wrap getServerSideProps for session checks
const withSession = async (context, callback) => {
  const session = await getSession({ req: context.req });
  const baseUrl = process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'

  console.log("sessionFromWithSession", session)
  if (!session && baseUrl !== 'http://localhost:3000') {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }
  return callback(context, session);
};

export default withSession;