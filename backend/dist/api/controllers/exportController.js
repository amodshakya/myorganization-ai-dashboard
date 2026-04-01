"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCSV = exportCSV;
exports.exportPDF = exportPDF;
const sequelize_1 = require("sequelize");
const json2csv_1 = require("json2csv");
const pdfkit_1 = __importDefault(require("pdfkit"));
const moment_1 = __importDefault(require("moment"));
const models_1 = require("../../models");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = __importDefault(require("../../logger"));
async function exportCSV(req, res, next) {
    try {
        const { startDate, endDate, source } = req.query;
        const where = {};
        if (source)
            where['source'] = source;
        if (startDate || endDate) {
            const range = {};
            if (startDate)
                range[sequelize_1.Op.gte] = new Date(startDate);
            if (endDate)
                range[sequelize_1.Op.lte] = new Date(endDate);
            where['timestamp'] = range;
        }
        const rows = await models_1.RenewableGeneration.findAll({
            where,
            order: [['timestamp', 'DESC']],
            limit: 5000,
            raw: true,
        });
        if (rows.length === 0) {
            throw new errorHandler_1.AppError('No data available for the given filters.', 404);
        }
        const fields = ['id', 'source', 'value_mw', 'timestamp', 'state', 'data_source'];
        const parser = new json2csv_1.Parser({ fields });
        const csv = parser.parse(rows);
        const filename = `renewable_generation_${(0, moment_1.default)().format('YYYY-MM-DD_HH-mm-ss')}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);
    }
    catch (error) {
        logger_1.default.error('exportController.exportCSV error:', error);
        next(error);
    }
}
async function exportPDF(req, res, next) {
    try {
        const capacityRows = await models_1.RenewableCapacity.findAll({
            attributes: [
                'source_type',
                [require('sequelize').fn('SUM', require('sequelize').col('capacity_mw')), 'total_mw'],
            ],
            group: ['source_type'],
            raw: true,
        });
        const genRows = await models_1.RenewableGeneration.findAll({
            attributes: [
                'source',
                [require('sequelize').fn('AVG', require('sequelize').col('value_mw')), 'avg_mw'],
            ],
            group: ['source'],
            raw: true,
        });
        const doc = new pdfkit_1.default({ margin: 50 });
        const filename = `renewable_energy_report_${(0, moment_1.default)().format('YYYY-MM-DD')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        doc.pipe(res);
        // Title
        doc.fontSize(22).fillColor('#1a5276').text('Indian Renewable Energy Dashboard', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#555').text(`Report generated: ${(0, moment_1.default)().format('MMMM Do YYYY, h:mm a')}`, { align: 'center' });
        doc.moveDown(1.5);
        // Installed Capacity Summary
        doc.fontSize(16).fillColor('#1a5276').text('Installed Capacity by Source');
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#333');
        let totalMW = 0;
        for (const row of capacityRows) {
            const mw = parseFloat(row.total_mw);
            totalMW += mw;
            doc.text(`${row.source_type.toUpperCase().padEnd(14)} ${(mw / 1000).toFixed(2).padStart(8)} GW`);
        }
        doc.moveDown(0.3);
        doc.fontSize(11).fillColor('#1a5276').text(`Total Installed: ${(totalMW / 1000).toFixed(2)} GW`);
        doc.moveDown(1.5);
        // Current Generation Summary
        doc.fontSize(16).fillColor('#1a5276').text('Average Current Generation by Source');
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#333');
        for (const row of genRows) {
            const mw = parseFloat(row.avg_mw);
            doc.text(`${row.source.toUpperCase().padEnd(14)} ${mw.toFixed(0).padStart(10)} MW`);
        }
        doc.moveDown(1.5);
        // India 2030 Target
        doc.fontSize(14).fillColor('#1a5276').text('India 2030 Renewable Energy Target');
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor('#333');
        doc.text('Target: 500 GW installed renewable capacity by 2030');
        doc.text(`Progress: ${(totalMW / 1000).toFixed(2)} GW installed (${((totalMW / 500000) * 100).toFixed(1)}% of target)`);
        doc.moveDown(1.5);
        doc.fontSize(8).fillColor('#aaa').text('Data sourced from MNRE, CEA, and Ministry of Power. Values are indicative.', { align: 'center' });
        doc.end();
    }
    catch (error) {
        logger_1.default.error('exportController.exportPDF error:', error);
        next(error);
    }
}
//# sourceMappingURL=exportController.js.map