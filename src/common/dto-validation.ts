import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'

export async function buildAndValidateDto<T extends object>(
  constructor: ClassConstructor<T>,
  data: unknown,
): Promise<T> {
  const dto = plainToInstance(constructor, data)

  const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true })
  if (errors.length > 0) {
    throw new Error(formatValidationErrors(errors).reduce(
      (message, error) => message + error.description,
      '\n',
    ))
  }

  return dto
}

type FormattedValidationError = {
  property: string
  description: string
}

function formatValidationErrors(errors: ValidationError[]): FormattedValidationError[] {
  return errors.flatMap(error => {
    const parentErrors = Object
      .values(error.constraints ?? {})
      .map(description => ({ property: error.property, description }))
    const childrenErrors = error.children
      ? formatValidationErrors(error.children)
      : []
    return parentErrors.concat(childrenErrors)
  })
}

export function buildValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: errors => new BadRequestException({
      message: 'Bad request',
      errors: formatValidationErrors(errors),
    }),
    stopAtFirstError: true,
  })
}