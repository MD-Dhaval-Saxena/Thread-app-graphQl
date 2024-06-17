import express, { query } from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { PrismaClient } from "@prisma/client";
import { prismaClient } from "./lib/db";
const app = express();
app.use(express.json());

const port = 3000;

const Main = async () => {
  // Create graphql server
  const gqlserver = new ApolloServer({
    typeDefs: `
        type Query {
            hello:String
            say(name:String):String
        }
        type Mutation{
          createUser(firstName:String!,lastName:String!,email:String!,password:String!):Boolean
        }
    
    `,
    resolvers: {
      Query: {
        hello: () => `Hey I am learning graphql`,
        say: (_, { name }: { name: string }) => `Hey ${name} ! How are you.`,
      },
      Mutation: {
        createUser: async (
          _,
          {
            firstName,
            lastName,
            email,
            password,
          }: {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
          }
        ) => {
          try {
            await prismaClient.user.create({
              data: {
                email,
                firstName,
                lastName,
                password,
                salt: "random_salt",
                profileImageURL: "", // Added default empty string for profileImageURL
              },
            });
            return true;
          } catch (error) {
            console.log(error);
            return false;
          }
        },
      },
    },
  });

  //Start the gql Server
  await gqlserver.start();

  // Specify the path where we'd like to mount our server
  app.use("/graphql", expressMiddleware(gqlserver));

  app.get("/", (req, res) => {
    res.json({ message: ` get request succefull` });
  });

  app.listen(port, () => {
    console.log(`Server is running on ${port}`);
  });
};

Main();
