import Fastify from 'fastify'
import cors from '@fastify/cors'

const fastify = Fastify({
  logger: true
})

fastify.register(cors, {
  origin: '*', // You can customize the origin later based on your needs
  methods: ['GET', 'POST'], // Define allowed HTTP methods
})

fastify.register((instance, opts, done) => {
  instance.get('/', function (request, reply) {
    reply.send('Hello World!');
  });
  done();
}, { prefix: '/api' });


fastify.listen({ port: process.env.PORT || 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})