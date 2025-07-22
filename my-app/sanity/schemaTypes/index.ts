import { type SchemaTypeDefinition } from 'sanity'
import { userType } from './userType'
import { teacherType } from './teacherType'
import { postType } from './postType'
import { commentType } from './commentType'
import { embeddedCommentType } from './embeddedCommentType'
import { favoriteType } from './favoriteType'
import { blogType } from './blogType'
import { communityType } from './communityType'
import { tagType } from './tagType'
import { reportType } from './reportType'
import notificationType from './notificationType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [userType, teacherType, postType, commentType, embeddedCommentType, favoriteType, blogType, communityType, tagType, reportType, notificationType],
}
