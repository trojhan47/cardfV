import { prisma } from "@/server/db";
import type { GetServerSideProps, GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../server/auth";

export const requireBvn =
  (func: GetServerSideProps) => async (ctx: GetServerSidePropsContext) => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);

    if (!session) {
      return {
        redirect: {
          destination: "/", // login path
          permanent: false,
        },
      };
    }
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if(user?.bvnVerified === false) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }

    return await func(ctx);
  };
