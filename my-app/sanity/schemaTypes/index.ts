import { type SchemaTypeDefinition } from 'sanity'
import { userType } from './userType'
import { teacherType } from './teacherType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [userType, teacherType],
}
