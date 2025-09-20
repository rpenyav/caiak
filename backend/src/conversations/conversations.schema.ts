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
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
