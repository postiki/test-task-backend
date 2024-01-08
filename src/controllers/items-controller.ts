import express, {NextFunction, Request, Response} from 'express';
import createError from 'http-errors';
import ItemModel, {IItem} from '../db/models/Item';

interface ShopifyImage {
    node: {
        src: string;
    };
}

interface ShopifyProductNode {
    id: string;
    title: string;
    bodyHtml: string;
    images: {
        edges: ShopifyImage[];
    };
}

interface ShopifyProductEdge {
    node: ShopifyProductNode;
}

interface ShopifyProductsResponse {
    data: {
        products: {
            edges: ShopifyProductEdge[];
        };
    };
}

export class ItemsController {
    public readonly router = express.Router();

    constructor() {
        this.router.get('/', this.getData.bind(this));
    }

    private async getData(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            let items = await ItemsController.getItemsFromDatabase();

            if (items.length === 0) {
                items = await ItemsController.fetchItems();
                await ItemsController.saveItemsToDatabase(items);
            }

            res.send(items);
        } catch (e) {
            console.error(e);
            next(createError(500, 'Internal Server Error'));
        }
    }

    static async getItemsFromDatabase(): Promise<IItem[]> {
        try {
            return await ItemModel.find() as IItem[];
        } catch (error) {
            console.error('Error fetching items from database:', error);
            throw error;
        }
    }

    static async saveItemsToDatabase(items: IItem[]): Promise<void> {
        try {
            await ItemModel.insertMany(items);
        } catch (error) {
            console.error('Error saving items to database:', error);
            throw error;
        }
    }

    static async fetchItems(): Promise<IItem[]> {
        const SHOPIFY_STORE_DOMAIN = 'cpb-new-developer.myshopify.com';
        const ACCESS_TOKEN = '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';
        const query = JSON.stringify({
            query: `{
            products(first: 10) {
                edges {
                    node {
                        id
                        title
                        bodyHtml
                        images(first: 1) {
                            edges {
                                node {
                                    src
                                }
                            }
                        }
                    }
                }
            }
        }`
        });

        try {
            const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/graphql.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': ACCESS_TOKEN
                },
                body: query
            });

            const jsonResponse: ShopifyProductsResponse = await response.json();

            return jsonResponse.data.products.edges.map(edge => new ItemModel({
                id: edge.node.id,
                title: edge.node.title,
                bodyHtml: edge.node.bodyHtml,
                images: edge.node.images.edges.map(imageEdge => ({src: imageEdge.node.src}))
            }));
        } catch (error) {
            console.error('Error fetching items from Shopify:', error);
            throw error;
        }
    }
}