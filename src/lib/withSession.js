import { getSession } from 'next-auth/react';

// Higher-order function to wrap getServerSideProps for session checks
const withSession = async (context, callback) => {
  const session = await getSession({ req: context.req });

  console.log("sessionFromWithSession", session)
  if (!session) {
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