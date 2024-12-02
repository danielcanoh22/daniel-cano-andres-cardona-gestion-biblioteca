import prisma from 'config/prisma';

const BookCustomResolvers = {
  Mutation: {
    reserveBook: async (
      _: any,
      { userId, bookId }: { userId: string; bookId: string }
    ) => {
      try {
        // Verificar si el usuario ya tiene una reserva activa para el mismo libro
        const existingReservation = await prisma.reservation.findFirst({
          where: {
            userId,
            bookId,
            returned: false, // Verificar que la reserva no haya sido devuelta
          },
        });

        if (existingReservation) {
          throw new Error(
            'Ya tienes este libro reservado y no ha sido devuelto.'
          );
        }

        // Verificar si hay copias disponibles
        const book = await prisma.book.findUnique({
          where: { id: bookId },
        });

        if (!book) {
          throw new Error('El libro no existe.');
        }

        if (book.copies_available <= 0) {
          throw new Error('No hay copias disponibles de este libro.');
        }

        // Crear la reserva y actualizar las copias disponibles
        await prisma.$transaction(async (prisma) => {
          await prisma.book.update({
            where: { id: bookId },
            data: {
              copies_available: {
                decrement: 1,
              },
            },
          });

          await prisma.reservation.create({
            data: {
              userId,
              bookId,
            },
          });
        });

        return 'Reserva realizada con éxito';
      } catch (error) {
        console.error('Error al reservar el libro:', error);
        throw new Error('Hubo un problema al realizar la reserva.');
      }
    },

    markAsReturned: async (
      _: any,
      { reservationId }: { reservationId: string }
    ) => {
      try {
        // Buscar la reserva por el ID
        const reservation = await prisma.reservation.findUnique({
          where: { id: reservationId },
          include: { book: true }, // Incluir información del libro
        });

        // Validar si la reserva existe y si ya fue devuelta
        if (!reservation) {
          throw new Error('Reserva no encontrada.');
        }

        if (reservation.returned === true) {
          throw new Error('Este libro ya fue marcado como devuelto.');
        }

        // Cambiar el estado de la reserva a "devuelto"
        await prisma.reservation.update({
          where: { id: reservationId },
          data: { returned: true },
        });

        await prisma.book.update({
          where: { id: reservation?.book.id },
          data: {
            copies_available: {
              increment: 1,
            },
          },
        });

        return 'Libro devuelto con éxito.';
      } catch (error) {
        console.log('Error al marcar el libro como devuelto:', error);
        throw new Error(
          error.message || 'Hubo un problema al marcar el libro como devuelto.'
        );
      }
    },
  },
};

export default BookCustomResolvers;