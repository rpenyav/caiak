import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Conversation } from 'src/conversations/conversations.schema'; // Importaremos esto cuando creemos Conversations; por ahora, puedes comentarlo si no existe

export type WorkspaceDocument = Workspace & Document;

@Schema({ timestamps: true }) // Agrega createdAt y updatedAt automáticamente
export class Workspace {
  @Prop({ required: true, unique: true }) // Slug único para identificación
  slug: string;

  @Prop({ required: true }) // Nombre descriptivo del workspace
  name: string;

  @Prop({ type: [String], default: [] }) // Array de roles permitidos, e.g. ['admin', 'user']
  roles: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Conversation' }], default: [] }) // Array de referencias a Conversations (anidamiento)
  conversations: Conversation[]; // Esto enlaza con el schema de Conversations
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
