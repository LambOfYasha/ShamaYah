import { type SchemaTypeDefinition } from 'sanity'
import { userType } from './userType'
import { teacherType } from './teacherType'
import { postType } from './postType'
import { commentType } from './commentType'
import { favoriteType } from './favoriteType'
import { blogType } from './blogType'
import { communityType } from './communityType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [userType, teacherType, postType, commentType, favoriteType, blogType, communityType],
}
