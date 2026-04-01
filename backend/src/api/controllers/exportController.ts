import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import moment from 'moment';
import { RenewableGeneration, RenewableCapacity } from '../../models';
import { AppError } from '../middleware/errorHandler';
import logger from '../../logger';

export async function exportCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate, source } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    if (source) where['source'] = source;
    if (startDate || endDate) {
      const range: Record<string, Date> = {};
      if (startDate) range[Op.gte as unknown as string] = new Date(startDate);
      if (endDate) range[Op.lte as unknown as string] = new Date(endDate);
      where['timestamp'] = range;
    }

    const rows = await RenewableGeneration.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: 5000,
      raw: true,
    });

    if (rows.length === 0) {
      throw new AppError('No data available for the given filters.', 404);
    }

    const fields = ['id', 'source', 'value_mw', 'timestamp', 'state', 'data_source'];
    const parser = new Parser({ fields });
    const csv = parser.parse(rows);

    const filename = `renewable_generation_${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    logger.error('exportController.exportCSV error:', error);
    next(error);
  }
}

export async function exportPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const capacityRows = await RenewableCapacity.findAll({
      attributes: [
        'source_type',
        [require('sequelize').fn('SUM', require('sequelize').col('capacity_mw')), 'total_mw'],
      ],
      group: ['source_type'],
      raw: true,
    }) as unknown as Array<{ source_type: string; total_mw: string }>;

    const genRows = await RenewableGeneration.findAll({
      attributes: [
        'source',
        [require('sequelize').fn('AVG', require('sequelize').col('value_mw')), 'avg_mw'],
      ],
      group: ['source'],
      raw: true,
    }) as unknown as Array<{ source: string; avg_mw: string }>;

    const doc = new PDFDocument({ margin: 50 });
    const filename = `renewable_energy_report_${moment().format('YYYY-MM-DD')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Title
    doc.fontSize(22).fillColor('#1a5276').text('Indian Renewable Energy Dashboard', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#555').text(`Report generated: ${moment().format('MMMM Do YYYY, h:mm a')}`, { align: 'center' });
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

    doc.fontSize(8).fillColor('#aaa').text(
      'Data sourced from MNRE, CEA, and Ministry of Power. Values are indicative.',
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    logger.error('exportController.exportPDF error:', error);
    next(error);
  }
}
