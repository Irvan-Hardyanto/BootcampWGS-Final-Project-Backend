module.exports={
    HOST:"localhost",
    USER:"postgres",
    PASSWORD:"SV8DaTy1",
    DB:"db_final_project_testing",
    dialect:"postgres",
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}