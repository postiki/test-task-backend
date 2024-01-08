import mongoose, { Document, Schema } from 'mongoose';

export interface IItem {
    id: string;
    title: string;
    bodyHtml: string;
    images: { src: string }[];
}

const itemSchema = new Schema<IItem & Document>({
    id: { type: String, required: true },
    title: { type: String, required: true },
    bodyHtml: String,
    images: [{ src: String }]
});

const ItemModel = mongoose.model<IItem & Document>('Item', itemSchema);

export default ItemModel;
