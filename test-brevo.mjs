const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  console.error('❌ BREVO_API_KEY not set');
  process.exit(1);
}

try {
  const response = await fetch('https://api.brevo.com/v3/account', {
    headers: {
      'api-key': apiKey,
      'accept': 'application/json'
    }
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Brevo API key is valid!');
    console.log(`   Account: ${data.email}`);
  } else {
    const error = await response.text();
    console.error('❌ Brevo API error:', response.status, error);
    process.exit(1);
  }
} catch (err) {
  console.error('❌ Network error:', err.message);
  process.exit(1);
}
