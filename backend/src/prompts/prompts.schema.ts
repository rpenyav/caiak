import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Prompt extends Document {
  @Prop({ required: true, unique: true })
  appId: string;

  @Prop({ required: true })
  prompt: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PromptSchema = SchemaFactory.createForClass(Prompt);
