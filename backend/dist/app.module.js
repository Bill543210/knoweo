"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const search_module_1 = require("./search/search.module");
const user_progress_module_1 = require("./user-progress/user-progress.module");
const schools_module_1 = require("./schools/schools.module");
const companies_module_1 = require("./companies/companies.module");
const domains_module_1 = require("./domains/domains.module");
const questions_module_1 = require("./questions/questions.module");
const user_entity_1 = require("./users/user.entity");
const user_progress_entity_1 = require("./user-progress/user-progress.entity");
const school_entity_1 = require("./schools/school.entity");
const company_entity_1 = require("./companies/company.entity");
const domain_entity_1 = require("./domains/domain.entity");
const question_entity_1 = require("./questions/question.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: 'localhost',
                port: 5432,
                username: 'postgres',
                password: '$Language1',
                database: 'knoweo',
                entities: [user_entity_1.User, user_progress_entity_1.UserProgress, school_entity_1.School, company_entity_1.Company, domain_entity_1.Domain, question_entity_1.Question],
                synchronize: true,
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            search_module_1.SearchModule,
            user_progress_module_1.UserProgressModule,
            schools_module_1.SchoolsModule,
            companies_module_1.CompaniesModule,
            domains_module_1.DomainsModule,
            questions_module_1.QuestionsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map