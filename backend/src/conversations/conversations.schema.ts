import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  roles: string[];

  @Prop({ type: String, required: true, index: true })
  workspaceSlug: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }], default: [] })
  messages: Types.ObjectId[];

  // usuario creador
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdBy: Types.ObjectId;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// 👇 Índices útiles (compuestos) para acelerar consultas habituales
ConversationSchema.index({ workspaceSlug: 1, createdBy: 1, createdAt: -1 });
ConversationSchema.index({ createdBy: 1, createdAt: -1 });
