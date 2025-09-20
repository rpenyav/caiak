import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ required: true })
  conversationId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  workspaceSlug: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true, enum: ['human', 'bot'] })
  sender: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: [String], required: false })
  fileUrls?: string[]; // Array de URLs de archivos
}

export const MessageSchema = SchemaFactory.createForClass(Message);
