const eventService = require('../services/event.service');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const createEvent = async (req, res) => {
  try {
    const { name, description, date_event, local, visible } = req.body;
    let imagePath = null;

    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `event-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('event-images')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        console.error('Erro ao enviar imagem:', error);
        return res.status(500).json({ error: 'Erro ao enviar imagem' });
      }

      const { data: publicUrlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName);

      imagePath = publicUrlData.publicUrl;
    }

    const event = await eventService.createEvent({
      name,
      description,
      date_event,
      local,
      visible: visible === 'true' || visible === true,
      image: imagePath,
    });
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
};

const listEvents = async (_req, res) => {
  try {
    const events = await eventService.listEvents();
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
};

const updateEvent = async (req, res) => {
  try {
    console.log(req.method, req.body);
    const { id } = req.params;
    const updates = req.body;
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `event-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('event-images')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });
      if (error) {
        console.error('Erro ao subir imagem:', error);
        return res.status(500).json({ error: 'Erro ao salvar imagem' });
      }

      const { data: publicUrlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName);

      updates.image = publicUrlData.publicUrl;
    }

    const event = await eventService.updateEvent(id, updates);
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await eventService.deleteEvent(id);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar evento' });
  }
};

const getEventAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const views = await eventService.getEventViews(id);
    const total_views = views.length;
    const last_viewed_at = views.reduce((acc, v) => acc > v.viewed_at ? acc : v.viewed_at, null);
    const unique_viewers = new Set(views.map(v => v.user_id)).size;
    res.json({ total_views, last_viewed_at, unique_viewers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar analíticos' });
  }
};

module.exports = {
  createEvent,
  listEvents,
  updateEvent,
  deleteEvent,
  getEventAnalytics,
};
