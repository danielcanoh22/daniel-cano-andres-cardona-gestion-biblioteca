import { PrismaClient } from '@prisma/client';
import safeJsonStringify from 'safe-json-stringify';

import Book from '@/src/components/molecules/Book';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_BOOKS } from '../utils/graphql/queries/books';
import { Book as BookType } from '@/src/types/book';

export async function getServerSideProps() {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany();
  return {
    props: {
      users: safeJsonStringify(users),
    },
  };
}

export default function Home() {
  const [books, setBooks] = useState([]);

  const { refetch } = useQuery(GET_ALL_BOOKS, {
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      setBooks(data.books);
    },
  });

  return (
    <div className='grid w-full'>
      <h1 className='text-3xl font-semibold mb-6'>Libros Disponibles</h1>
      <div className='flex flex-wrap gap-4'>
        {books.map((book: BookType) => (
          <div key={book.id} className='max-w-[300px]'>
            <Book book={book} refetch={refetch} />
          </div>
        ))}
      </div>
    </div>
  );
}
