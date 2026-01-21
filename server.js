require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const {app}=require('./app')

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
    console.log(`Gyanama Admin Panel: http://localhost:${PORT}/admin/login`);
    console.log('username=superadmin, password=Admin@123')
})
