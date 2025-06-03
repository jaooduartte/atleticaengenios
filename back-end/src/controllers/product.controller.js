const { createProduct, fetchProducts } = require('../services/product.service');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function addProduct(req, res) {
    try {
        const imageFile = req.file;
        let imageUrl = '';

        if (imageFile) {
            const fileExt = imageFile.originalname.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;

            const { error } = await supabase.storage
                .from('products')
                .upload(fileName, imageFile.buffer, {
                    contentType: imageFile.mimetype,
                });

            if (error) {
                console.error('Erro ao enviar imagem:', error);
                return res.status(500).json({ error: 'Erro ao enviar imagem' });
            }

            const { data: publicUrlData } = supabase.storage
                .from('products')
                .getPublicUrl(fileName);

            imageUrl = publicUrlData.publicUrl;
        }

        const product = await createProduct({
            ...req.body,
            image: imageUrl,
        });
        res.status(201).json(product);
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
}

async function getProducts(req, res) {
    try {
        const products = await fetchProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
}

module.exports = { addProduct, getProducts };