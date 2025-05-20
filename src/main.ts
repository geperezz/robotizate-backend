import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Robotízate Backend')
    .setDescription('The Robotízate Backend API description')
    .setVersion('0.1.0')
    .build()
  SwaggerModule.setup('docs', app, () => SwaggerModule.createDocument(app, swaggerConfig))

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
