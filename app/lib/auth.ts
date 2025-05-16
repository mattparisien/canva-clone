// import { NextAuthOptions } from "next-auth"
// import CredentialsProvider from "next-auth/providers/credentials"
// import { authAPI } from "./api"

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null
//         }

//         try {
//           const { user, token } = await authAPI.login(
//             credentials.email,
//             credentials.password
//           )

//           console.log("User authenticated:", user, token)

//           // Return user with token in a way NextAuth can use
//           return {
//             id: user._id,
//             name: user.name,
//             email: user.email,
//             accessToken: token
//           }
//         } catch (error) {
//           console.error("Authentication error:", error)
//           return null
//         }
//       }
//     })
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id
//         token.accessToken = user.accessToken
//       }
//       return token
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id as string
//         session.accessToken = token.accessToken as string
//       }
//       return session
//     }
//   },
//   pages: {
//     signIn: '/signin',
//     signOut: '/',
//     error: '/signin',
//   },
//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// }