const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const createEvent = async (data) => {
  const { error, data: inserted } = await supabase
    .from('events')
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return inserted;
};

const listEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date_event', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const updateEvent = async (id, updates) => {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const deleteEvent = async (id) => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
};

const getEventViews = async (eventId) => {
  const { data, error } = await supabase
    .from('views_events')
    .select('user_id, viewed_at')
    .eq('event_id', eventId);
  if (error) throw new Error(error.message);
  return data;
};

module.exports = {
  createEvent,
  listEvents,
  updateEvent,
  deleteEvent,
  getEventViews
};
